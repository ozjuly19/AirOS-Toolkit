from lib.airos import api

# Entry point for the script ---------------------------------------------------------------------
if (__name__ == '__main__'):
    _airos = api()
    _airos.tryAuth()

    print('AirOS Toolkit')
    
    if (_airos.tryAuth()):
        print('True')