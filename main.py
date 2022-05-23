from os import system
from lib.airos import api

# Entry point for the script ---------------------------------------------------------------------
if (__name__ == '__main__'):
    airosapi = api()

    print('AirOS Toolkit')
    ip = input('IP Address: ')

    if (airosapi.tryAuth(ip, input('Username: '), input('Password: '))):
        system('cls')
        print('Authenticated!')
        host = airosapi.getStatus(ip)['host']
        print('Firmware: ' + host['fwversion'])
        print('Model: ' + host['devmodel'])
    else:
        print('Incorrect username/password')