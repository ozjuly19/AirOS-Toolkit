# AirOS-Toolkit
## This Pyhon 3.9 script & library can log into Ubiquity airMax and airFiber devices getting important information automatically.


> Using the config.json file you can setup the bruteforce login info (usernames & passwords) alongside being able to setup the CIDR scan range.

 - This script outputs a debug log (debug.log) of the console output to its home directory.
 - All the contacted devices and information of them to a csv file (log.csv)
 - And uses multiprocessing to speed up certian processes within

### To configure multiproccessing pool sizes open config.json and find the line:
```json
  "mpPoolSize":5
```
You can change the integer (default 5) as high ***as your system can handle*** which will speed up certian processes within the script.


__IF THE SCRIPT THROWS ERRORS WHEN LAUNCHING LIKE__:
```
ValueError: need at most 63 handles, got a sequence of length 70
```
__YOU MUST TURN DOWN mpPoolSize__


# Installation and Usage
0. Clone the repo and unpack
1. Python v3 is required for this script to run
   - pip is needed to install required packages
     - Required packages are:
       - os
       - csv
       - json
       - requests
       - ipaddress
       - functools
       - multiprocessing
       - airos -> included in /lib/airos.py
       - ping3
2. After installing required packages place the script in its own directory
3. Before running rename __config-template.json__ to __config.json__ and edit the variables inside. (Example config seen below)
4. Profit!




### Example config

File name: __config.json__
```json
{
    "auth": {
        "usernames": [
            "root",
            "admin"
        ],
        "passwords": [
            "!password0",
            "p455w0rd1",
            "PassWord2"
        ]
    },
    "cidr": "10.10.0.0/24",
    "mpPoolSize": 5
}
```
