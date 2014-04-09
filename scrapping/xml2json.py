from bs4 import BeautifulSoup as Soup
import csv
import pyUtils
import sys
import json

schools = dict()
key_field_name = 'School name'
key_field_column = -1

def parseFile(file):
  print("Reading file " + file)  
  handler = pyUtils.readLocalFile(file)
  year = pyUtils.getFileNameWithoutExtension(file)[pyUtils.getLastIndexOf(file, '-') + 1:]
  # print(handler)
  soup = Soup(handler)
  rows = soup.findAll('row')
  headers = []

  row_num = 0
  headers_row_num = -1
  found_headers = False
  for row in rows:
    # print(row)
    csv_row = []
    styleId = row.get('ss:styleid', '')    
    if found_headers is False:      
      if styleId == 's5':
        found_headers = True
        # headers_row_num = i
        cells = row.findAll('data')
        for i in range(0, len(cells)):
          cell = cells[i]
        # for cell in cells:
          # csv_row.append(pyUtils.returnNormalText(cell.contents[0]))
          headers.append(pyUtils.returnNormalText(cell.contents[0]))

          if cell.contents[0] == key_field_name:
            key_field_column = i

        # writer.writerow(csv_row)

    else:
      autofitheight = row.get('ss:AutoFitHeight'.lower(), '')
      # print("autofitheight: " + autofitheight)
      if autofitheight == "0":
        # print("autoheight is 0")
        school = {}
        cells = row.findAll('cell')
        # for column in cells:
        for i in range(0, len(cells)):
          column = cells[i]
          dataType = column.data['ss:Type'.lower()]
          if len(column.data.contents) == 0:            
            if dataType.lower() == 'number':
              # csv_row.append(-100)
              school[headers[i]] = -100
            else:
              # csv_row.append('')
              school[headers[i]] = ''

          else:
            if dataType.lower() == 'number':
              # csv_row.append(column.data.contents[0].replace(',', '.'))
              school[headers[i]] = column.data.contents[0].replace(',', '.')
            else:
              content = column.data.contents[0]
              # csv_row.append(pyUtils.returnNormalText(content))   
              school[headers[i]] = pyUtils.returnNormalText(content)

        # writer.writerow(csv_row)
        addSchoolData(cells[key_field_column].data.contents[0], year, school)

    # print("Row num: " + str(row_num))
    row_num = row_num + 1

  
  # file.close()

def addSchoolData(schoolName, year, data):
  if schoolName not in schools:    
    schools[schoolName] = {}

  value = schools[schoolName]
  value[year] = data

  schools[schoolName] = value

  # for x in schools:
  #   print (x)
  #   for y in schools[x]:
  #     print (y,':',schools[x][y])

def buildFinalObj():
  finalObj = []
  for key in schools:
    obj = {}
    obj['name'] = key
    obj['data'] = schools[key]
    # for years in schools[key]:
    #   obj[years] = schools[key][years]

    finalObj.append(obj)

  return finalObj

if __name__ == "__main__":
  print("Parser of Excel XMLs by @vpascual\n")
  list_of_files = pyUtils.getListOfFilesFromPath('data/global-mba-rankings/', '', '.xml')  
  # list_of_files = pyUtils.getListOfFilesFromPath('data/masters_in_management/', '', '.xml')  

  output_file = open(pyUtils.getFileNameWithoutExtension('global') + '.json', 'wb')
  # writer = csv.writer(output_file, delimiter=';', quotechar='"', quoting=csv.QUOTE_NONNUMERIC)
  for f in list_of_files:
    parseFile(f)

  output_file.write(json.dumps(buildFinalObj()))
