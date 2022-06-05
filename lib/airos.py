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
        result = self.ws.get(url=schema + url + uri,
                             timeout=timeout, verify=verify)
        return result

    def __post(self, url: str, uri: str, payload: dict, schema='https://', timeout=10, verify=False):
        """Internal function for a web post request
        Args: 'url' URL for a post request
              'uri' URI for a post request
              'payload' post data
              'schema' (default: 'https://') HTTP schema
              'timeout' (default: 10) time to wait before timing out the request
              'verify' (default: False) if true get requests do not verify the ssl certificate
        """
        try:
            result = self.ws.post(schema + url + uri, payload,
                                  timeout=timeout, verify=verify)
        except requests.exceptions.ConnectionError:
            return None
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
        sc = self.__get(str(ip), '/api/auth').status_code

        # Detect estimate firmware version
        if sc == 200:
            # If the http status is 200 this likely means the device is running
            # AirOS v4.0 and does not have a /api/auth uri and redirects to the login page
            return 0
        elif sc == 401:
            # If the http status is 401 this likely means the device is running
            # AirOS v4.1+ and does not have a /api/auth uri and does not redirect
            # to a login page

            # Required to recieve PROPER cookie as getting /api/auth returns fake cookie
            # on version 4.1 for reasons (I'm not sure possibly a lefover from attempting to
            # then putting off going to the v8 way of /api/auth handling)
            self.__get(str(ip), '/login.cgi')
            return 1
        elif sc == 403:
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

    def getStatus(self, ip: ipaddress.IPv4Address):
        status = self.__get(str(ip), '/status.cgi').json()
        return status

    def tryAuth(self, ip: ipaddress.IPv4Address, username: str, password: str):
        """Function for attepmting authentication with username/password
        Returns False as error state
        Args: 'ip' IPv4 address for authentication
        """
        # validate given IPv4 address to avoid errors
        if self.__validateIP(ip):
            # Call __authMethod for the required detection of different
            # AirOS versions and get required session id cooke for
            # older versions of AirOS v4.*
            authMethodIndex = self.__authMethod(ip)

            # Handle authentication methods
            if authMethodIndex == 0 or authMethodIndex == 1:
                # AirOS v4.0 & AirOS v4.1+
                self.__post(str(ip), '/login.cgi',
                            {'username': username, 'password': password})
                res = self.__get(str(ip), '/status.cgi')

                # res will not throw a JSONDecodeError if authenticated
                try:
                    res.json()
                    return 200
                except requests.JSONDecodeError:
                    return 403
            elif authMethodIndex == 2:
                # AirOS v8.*
                try:
                    res = self.__post(
                        str(ip), '/api/auth', {'username': username, 'password': password}).status_code
                except AttributeError:
                    res = 404
                # res will be http status code 200 if authenticated
                return res
            else:
                return 404
        else:
            return 404

            
    def __init__(self, disableSSLWarn = True):
        """Initialize the api class
        Args: 'dissableSSLWarn' (default: True) enables ssl warn suppression or disabeles it"""
        # self.ws is the requests session used for saving cookies on comunications
        self.ws = requests.Session()

        # Disable ssl warnings due to self signed ssl on Ubiquity devices
        if (disableSSLWarn):
            requests.packages.urllib3.disable_warnings()
