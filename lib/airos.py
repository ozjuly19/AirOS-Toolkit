import requests
import ipaddress


class api:
    def __get(self, url: str, uri, schema='https://', timeout=10, verify=False):
        """Internal function for a web get request
        Args: 'url' URL for a get request
              'uri' URI for the get request
              'schema' (default: 'https://') HTTP schema
              'timeout' (default: 10) time to wait before timing out the request
              'verify' (default: False) if true get requests do not verify the ssl certificate
        """
        result = self.ws.get(url=schema + url + uri, timeout=timeout, verify=verify)
        return result


    def __post(self, url: str, uri, payload, schema='https://', timeout=10, verify=False):
        """Internal function for a web post request
        Args: 'url' URL for a post request
              'uri' URI for a post request
              'payload' post data
              'schema' (default: 'https://') HTTP schema
              'timeout' (default: 10) time to wait before timing out the request
              'verify' (default: False) if true get requests do not verify the ssl certificate
        """
        result = self.ws.post(schema + url + uri, payload, timeout=timeout, verify=verify)
        return result


    def __authMethod(self, ip: ipaddress.IPv4Address):
        """Function for determining the method required for authentication
        Args: 'ip' IPv4 address of the target
        returns -1 for error state
        returns 0 for AirOS v4.0
        returns 1 for AirOS v4.1+
        returns 2 for AirOS v8.*
        """
        
        # Send get request to /api/auth different versions of AirOS respond with
        # different http status codes per the version the devices firmware is
        sc = self.__get(ip, '/api/auth').status_code
        
        # Detect estimate firmware version
        if (sc == 200):
            # If the http status is 200 this likely means the device is running
            # AirOS v4.0 and does not have a /api/auth uri and redirects to the login page
            return 0
        elif (sc == 401):
            # If the http status is 401 this likely means the device is running
            # AirOS v4.1+ and does not have a /api/auth uri and does not redirect
            # to a login page
            return 1
        elif (sc == 403):
            # If the https status is 403 this likely means the device is running
            # AirOS v8.* and has a /api/auth uri and will accept creds through it
            return 2
        else: 
            return -1

    def __validateIP(self, ip: ipaddress.IPv4Address):
        """Function for validating an IP (correct format i.e. 192.168.1.20
        Args: 'ip' IPv4 address to check if it is an acceptable format
        """
        try:
            ip = ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False


    def tryAuth(self, ip: ipaddress.IPv4Address):
        """Function for attepmting authentication with username/password
        Returns False as error state
        Args: 'ip' IPv4 address for authentication
        """
        # validate given IPv4 address to avoid errors
        if (self.__validateIP(ip)):

            self.__authMethod(ip)


            return True
        else:
            return False

            
    def __init__(self):
        # self.ws is the requests session used for saving cookies on comunications
        self.ws = requests.Session()