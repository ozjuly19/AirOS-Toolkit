from lib.airos import api

# Entry point for the script ---------------------------------------------------------------------
if (__name__ == '__main__'):
    airosapi = api()

    print('AirOS Toolkit')
    
    #airosapi.tryAuth('192.168.1.1')
    #airosapi.get('https://10.1.0.1/')