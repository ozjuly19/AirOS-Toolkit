# AirOS-Toolkit
## This Pyhon 3.9 library can log into Ubiquity airMax and airFiber devices getting important information automatically.

# Installation and Usage
1. Python v3 is required for this library to run
   - pip might be needed to install required packages
     - Required packages are:
       - requests
       - ipaddress
2. Profit!




### Usage

main.py just shows basic useage of the library and how to import it, it is **NOT** important for using the library and can be removed entirely or re-written
```py
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
```
