# Utils library created by @vpascual

import urllib2
import os
import ntpath

# return the content of a local file
def readLocalFile(file):
  return open(file).read()

# returns the content of a URL
def readRemoteFile(url):
  return urllib2.urlopen(project['url']).read()

# returns a list of the files inside a given path that starts with "startsWidth" and ends with "endWith"
def getListOfFilesFromPath(path, startswith, endswith):
  dirname = os.path.realpath(path)
  list_of_files = [os.path.join(dirname, file) for file in os.listdir(dirname) if (file.lower().endswith(endswith) and file.lower().startswith(startswith)) ]
  return list_of_files

def getFileNameWithoutExtension(filename):
  return os.path.splitext(filename)[0]

# given a text returns the position of the last occurrence of a character
def getLastIndexOf(text, char):
  return text.rfind(char)

# given a text protentially fucked up by no ascii chars and so on, returns a writable text encoded in utf-8
def returnNormalText(text):
  valid_utf8 = True
  try:
      text.decode('utf-8')
  except UnicodeEncodeError as e:
      valid_utf8 = False

  if valid_utf8:
    return text
  else:
    return text.encode('utf-8')

def printObject(obj):
  for x in obj:
    print (x)
    for y in obj[x]:
      print (y,':',obj[x][y])