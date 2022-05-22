from lib.airos import api

# Entry point for the script ---------------------------------------------------------------------
if (__name__ == '__main__'):
    airosapi = api()

    print('AirOS Toolkit')
    
    if (airosapi.tryAuth('192.168.1.1', 'root', 'password')):
        print('Authenticated!')
    else:
        print('Incorrect username/password')