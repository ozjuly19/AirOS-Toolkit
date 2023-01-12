import hashlib
import os
import csv
import json
import ipaddress
import time
from ping3 import ping  # Needs installed
from functools import partial
from lib.airos import api  # Internal API
import datetime
from multiprocessing import Pool


def writeToCSVA(data):
    file = open('files/info.csv', 'a', newline='')
    writer = csv.writer(file)
    writer.writerows(data)
    file.close()


def writeToCSV(data, name = 'info.csv'):
    file = open('files/' + name, 'w', newline='')
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

    logFile = open('files/debug.log', 'a')
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
def deserialize(path, logErr = True):
    try:
        file = open(path, 'r')
        jsonParse = json.load(file)
    except Exception as e:
        if logErr:
            log(e)
        return None
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
        newLine = dict()
        newLine['id']              = id       # ID
        newLine['alive']           = True     # Alive IP
        ip                         = cidr[id] # IP Address
        newLine['ip']              = ip
        newLine['devName']:    str = 'N/A'    # Device Name
        newLine['devModel']:   str = 'N/A'    # Device Model
        newLine['devFwVer']:   str = 'N/A'    # Firmware Version
        newLine['user']:       str = 'N/A'    # Username
        newLine['pwID']:       int = 0        # Used Password
        newLine['ssid']:       str = 'N/A'    # Devices connected/broadcasting ssid
        newLine['mode']:       str = 'N/A'    # Radio mode (i.e. ap)
        newLine['frequency']:  str = 'N/A'    # Radio Frequency
        newLine['bandwidth']:  str = 'N/A'    # Radio bandwidth
        newLine['isDfs']:      str = 'N/A'    # If the radio is in dfs channels
        newLine['httpCode']:   int = 999      # HTTP Code

        # if the IP is dead skip other operations and log this
        if ip in deadIPs:
            newLine['alive'] = False
            newLine['httpCode'] = 502
            newLine['ip'] = str(ip)

            data.append(list(newLine.values()))
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
                # Deserialize the stored mode
                givenMode = str(statusJson['wireless']['mode'])
                
                modeLookup = {
                    'sta-ptmp': 'Station',
                    'ap-ptmp': 'AP',
                    'ap-ptp': 'PTP Master',
                    'sta-ptp': 'PTP Slave',
                    'master': 'AirFiber Master',
                    'slave': 'AirFiber Slave'
                    }

                newLine['mode'] = modeLookup[givenMode]
            except Exception:
                try:
                    # Is likely airfiber
                    givenMode = str(statusJson['wireless']['opmode'])

                    modeLookup = {
                        'sta-ptmp': 'Station',
                        'ap-ptmp': 'AP',
                        'ap-ptp': 'PTP Master',
                        'sta-ptp': 'PTP Slave',
                        'master': 'AirFiber Master',
                        'slave': 'AirFiber Slave'
                        }

                    newLine['mode'] = modeLookup[givenMode]
                except:
                    newLine['mode'] = 'N/A'

            try:
                newLine['frequency'] = str(statusJson['wireless']['frequency']).replace(' MHz', '') # .replace removes ' MHz' from the frequency on some airos devices (airfiber)
            except Exception:
                newLine['frequency'] = 'N/A'

            try:
                newLine['ssid'] = statusJson['wireless']['essid']
            except Exception:
                newLine['ssid'] = 'N/A'

            try:
                if (statusJson['wireless']['dfs']):
                    newLine['isDfs'] = 'TRUE'
                else:
                    newLine['isDfs'] = 'FALSE'
            except Exception:
                newLine['isDfs'] = 'N/A'

            try:
                newLine['bandwidth'] = statusJson['wireless']['chanbw']
            except Exception:
                newLine['bandwidth'] = 'N/A'

            try:
                newLine['devName'] = statusJson['host']['hostname']
            except Exception:
                newLine['devName'] = 'N/A'

            try:
                newLine['devModel'] = statusJson['host']['devmodel']
            except Exception:
                newLine['devModel'] = 'N/A'

            try:
                newLine['devFwVer'] = statusJson['host']['fwversion']
            except Exception:
                newLine['devFwVer'] = 'N/A'

            # Write data to csv
            newLine['user'] = user
            newLine['pwID'] = pwID

        newLine['ip'] = str(ip)
        newLine['httpCode'] = httpCode
        data.append(list(newLine.values()))
    
    data.remove(data[0])
    return data

# ---------------------

# Investigate 5ac (gen1) authentication

# ---------------------


# Entry point for the script ---------------------------------------------------------------------
if __name__ == '__main__':
    #if 1 == 1: # Just added to use one part of the cidr
    for i in range(256):
        #i = 0
        # Clear log file
        f = open('files/debug.log', 'w')
        f.write('')
        f.close()

        # Welcome message
        log('--== AirOS Toolkit ' + str(datetime.datetime.today()) + ' ==--', False, True)

        log('Reading config...')

        # Get data from config file
        config = deserialize('files/config.json')

        # Assign data to variables
        cidr = '10.10.' + str(i) + '.0/24'#
        #cidr = config['cidr']
        poolSize = config['mpPoolSize']
        passwords = config['auth']['passwords']
        usernames = config['auth']['usernames']

        log('Done.')

        # Set CSV headers
        data = [['ID', 'Alive IP', 'IP Address', 'Device Name', 'Device Model',
                 'Firmware Version', 'Username', 'Used Password', 'SSID', 'Radio Mode', 'Frequency', 'Bandwidth', 'In DFS', 'HTTP Code']]

        writeToCSV(data)

        # Get cidr from json conf and catch any value errors
        try:
            cidr = ipaddress.ip_network(cidr)
        except ValueError as e:
            log(str(e), True)
            exit()
        networkCidr = cidr

        # Caching
        cacheExists = False
        cache = ''
        deadIPs = []
        ret = []
        hashedCidr = hashlib.md5(str(list(cidr.hosts())).encode('utf-8')).hexdigest()
        cacheFileDir = 'files/cache/' + hashedCidr + '.data'

        #print(hashedCidr)

        # Get data from cache file if it exists 
        cache = deserialize(cacheFileDir, False)
        if cache != None:
            cacheExists = True

        #exit()
        if cacheExists:
            log('--== Found cache\'d IPs ==--', False, True)

            modTimesinceEpoc = os.path.getmtime(cacheFileDir)
            modificationTime = time.strftime('%m-%d-%Y %H:%M:%S', time.localtime(modTimesinceEpoc))
            r = 'y'#input('[?] Do you want to used cached IP\'s updated on: ' + modificationTime + ' (Y/n): ')
            if r.lower() == 'y' or r.lower() == '':
                log('--== Using cache\'d IPs from ' + modificationTime + ' ==--', False, True)

                # Get data from cache file and set variables accordingly
                for a in cache['aliveIPs']:
                    ret.append(ipaddress.ip_address(a))

                for d in cache['deadIPs']:
                    deadIPs.append(ipaddress.ip_address(d))

        if not(cacheExists) or r.lower() == 'n':
            # Seperate the log
            log('--== Pinging CIDR ==--', False, True)

            # Cidr setup
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

            # Create cache file
            f = open(cacheFileDir, 'w')
            jsonDeadIPs = []
            jsonAliveIPs = []

            for ip in deadIPs:
                jsonDeadIPs.append(str(ip))

            for ip in ret:
                jsonAliveIPs.append(str(ip))

            json.dump({'aliveIPs': jsonAliveIPs, 'deadIPs': jsonDeadIPs}, f)
            f.close()
        else:
            # Cidr setup (known dupelication)
            cidr = list(cidr.hosts())
            cidr.remove(cidr[0])
            segment = split(cidr, poolSize)

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
        writeToCSV(data, str(networkCidr).replace('/', '-') + '.csv')

        # Inform user that execution is complete
        log('--== Operation complete ' + str(datetime.datetime.today()) + ' ==--', False, True)