from lib.airos import api

# Entry point for the script ---------------------------------------------------------------------
if (__name__ == '__main__'):
    airosapi = api()

    print('AirOS Toolkit')
    
    if (airosapi.tryAuth(input('IP Address: '), input('Username: '), input('Password: '))):
        print('Authenticated!')
    else:
        print('Incorrect username/password')