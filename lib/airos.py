import requests

class api:
    def __init__(self):
        global ws
        ws = requests.Session()
        self.webSession = ws

    def tryAuth(ip) -> bool:
        """Function for attepmting authentication with username/password
        Returns bool True indicates sucsessful authentication
        """
        
        return True
    
    def get(uri) -> requests.Response:
        """Internal function for a web get request"""