import os
import csv
import json
import ipaddress
from ping3 import ping  # Needs installed
from functools import partial
from lib.airos import api  # Internal API
import datetime
from multiprocessing import Pool


def writeToCSVA(data):
    file = open('files\\info.csv', 'a', newline='')
    writer = csv.writer(file)
    writer.writerows(data)
    file.close()


def writeToCSV(data):
    file = open('files\\info.csv', 'w', newline='')
    writer = csv.writer(file)
    writer.writerows(data)
    file.close()


# Split list into 'equal' parts
def split(a, n):
    k, m = divmod(len(a), n)
    return (a[i*k+min(i, m):(i+1)*k+min(i+1, m)] for i in range(n))


# log debug data
def log(msg, isError=False, isBanner=False):
    if isBanner:
        msg = '\n' + msg + '\n'
    else:
        if isError:
            msg = '\n[!] Error: ' + msg + '\n'
        else:
            msg = '[+] ' + msg

    logFile = open('files\\debug.log', 'a')
    logFile.write(msg + '\n')
    logFile.close
    print(msg)  # Output message


def getAliveIPS(cidr):
    """ Pings IP's in a CIDR
    returns the alive IPs
    """
    aliveIP = []
    for p in cidr:
        alive = ping(str(p))
        if not(alive):
            log('The host was not reachable, skipping. (' + str(p) + ')')
            continue
        else:
            log(str(p) + ' is alive.')
            aliveIP.append(p)
        if aliveIP != None:
            return aliveIP


# pull json data from .json file stored on disk
def deserialize(path):
    try:
        file = open(path, 'r')
    except FileNotFoundError as e:
        log('The requested file: ' + os.getcwd() +
            '\\' + path + ' was not found.', True)
        exit()
    jsonParse = json.load(file)
    file.close()
    return jsonParse


def processIPs(usernames, passwords, deadIPs, cidr):
    if cidr == []:
        return 0
    data = [[]]

    #print (str(usernames) + '\n\n')
    #print (str(passwords) + '\n\n')

    # Create api() object as airosapi
    airosapi = api()


    # Recursively execute code for every IP in cidr
    for id in range(len(cidr)):
        # Setup variables
        alive = True
        ip = cidr[id]
        devName:    str = 'N/A'
        devModel:   str = 'N/A'
        devFwVer:   str = 'N/A'
        user:       str = 'N/A'
        pwID:       int = 0
        uispStatus: str = 'N/A'
        httpCode:   int = 999

        # if the IP is dead skip other operations and log this
        if ip in deadIPs:
            alive = False
            httpCode = 502

            data.append([
                id,          # ID
                alive,       # Alive IP
                str(ip),          # IP Address
                devName,     # Device Name
                devModel,    # Device Model
                devFwVer,    # Firmware Version
                user,        # Username
                pwID,        # Used Password
                uispStatus,  # UISP Status
                httpCode     # HTTP Code
            ])
            continue

        # Inform the user of the current ip and index
        log('Remote IP address: ' + str(ip))
        log('Index is: ' + str(id))
        
        # Bruteforce user list -> pass list
        auth = False
        for userr in usernames:
            if auth:
                break
            for pwIDD in range(len(passwords)):
                # Try to authenticate and get the status of the attempt
                httpCode = airosapi.tryAuth(ip, userr, passwords[pwIDD])
                if httpCode == 200:
                    auth = True
                if auth:
                    pwID = pwIDD
                    user = userr
                    break

        if auth:
            log('Authenticated: ' + str(ip))
        
            # After authentication get status.cgi
            statusJson = airosapi.getStatus(ip)
            httpCode = 200

            # Get data and catch for missing variables
            try:
                uispStatus = str(statusJson['unms']['status'])
            except Exception:
                uispStatus = 'N/A'

            try:
                devName = str(statusJson['host']['hostname'])
            except Exception:
                devName = 'N/A'

            try:
                devModel = statusJson['host']['devmodel']
            except Exception:
                devModel = 'N/A'

            try:
                devFwVer = statusJson['host']['fwversion']
            except Exception:
                devFwVer = 'N/A'

        # Write data to csv
        data.append([
            id,          # ID
            alive,       # Alive IP
            str(ip),     # IP Address
            devName,     # Device Name
            devModel,    # Device Model
            devFwVer,    # Firmware Version
            user,        # Username
            pwID,        # Used Password
            uispStatus,  # UISP Status
            httpCode     # HTTP Code
        ])
    
    data.remove(data[0])
    return data

# Entry point for the script ---------------------------------------------------------------------
if __name__ == '__main__':
    # Clear log file
    f = open('files\\debug.log', 'w')
    f.write('')
    f.close()

    # Welcome message
    log('--== AirOS Toolkit ' + str(datetime.datetime.today()) + ' ==--', False, True)

    log('Reading config...')

    # Get data from config file
    config = deserialize('files\\config.json')

    # Assign data to variables
    cidr = config['cidr']
    poolSize = config['mpPoolSize']
    passwords = config['auth']['passwords']
    usernames = config['auth']['usernames']

    log('Done.')

    # Set CSV headers
    data = [['ID', 'Alive IP', 'IP Address', 'Device Name', 'Device Model',
             'Firmware Version', 'Username', 'Used Password', 'UISP Status', 'HTTP Code']]

    writeToCSV(data)

    # Seperate the log
    log('--== Pinging CIDR ==--', False, True)

    # Get cidr from json conf and catch any value errors
    try:
        cidr = ipaddress.ip_network(cidr)
    except ValueError as e:
        log(str(e), True)
        exit()

    # Multiprocessing pool setup
    cidr = list(cidr.hosts())
    cidr.remove(cidr[0])
    segment = split(cidr, poolSize)

    # Multiprocessing pool
    with Pool(poolSize) as p:
        ret = p.map(getAliveIPS, segment)
        ret = list([x for x in ret if x is not None])

    # Seperate the log
    log('--== Ping complete ==--', False, True)

    # Fix ret list (After ping it will be a list of lists list[][])
    _ret = []
    for p in range(len(ret)):
        _ret.append(ret[p][0])
    ret = _ret

    # Get IPs that did not respond to ping
    diff1 = set(ret).difference(set(cidr))
    diff2 = set(cidr).difference(set(ret))
    deadIPs = list(diff1.union(diff2))

    # Multiprocessing pool setup
    segment = split(cidr, poolSize)
    processIPsPartial = partial(processIPs, usernames, passwords, deadIPs)

    # Multiprocessing pool
    with Pool(poolSize) as p:
        procReturn = p.map(processIPsPartial, segment)
        procReturn = list(procReturn)

    log('--== Parsing output ==--', False, True)

    # Get data from the processes and fix it
    procReturn = list([x for x in procReturn if x != 0])
    for x in range(len(procReturn)):
        for v in range(len(procReturn)):
            try:
                data.append(procReturn[x][v])
            except:
                pass
    
    # Sort ip addresses
    #datab = data
    #datab.remove(data[0])
    #data = sorted(datab, key = lambda x: x[2])
    #print(data)

    for x in range(len(data)):
        if x != 0:
            data[x][0] = x - 1

    log('--== Writing data ==--', False, True)

    # write out data
    writeToCSV(data)
    
    # Inform user that execution is complete
    log('--== Operation complete ' + str(datetime.datetime.today()) + ' ==--', False, True)