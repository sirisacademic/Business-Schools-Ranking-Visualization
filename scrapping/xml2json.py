# Usage
# python xml2json.py data/global-mba-rankings global_ranking.json

from bs4 import BeautifulSoup as Soup
import csv
import pyUtils
import sys
import json

schools = dict()
key_field_name = 'School name'
country_field_name = 'Country'
key_field_column = -1
country_field_column = -1

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
    autofitheight = row.get('ss:AutoFitHeight'.lower(), '')
    # print(row)
    csv_row = []
    styleId = row.get('ss:styleid', '')    
    if found_headers is False:      
      if styleId == 's5' and autofitheight == '0':
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
          
          if cell.contents[0] == country_field_name:
            country_field_column = i


        # writer.writerow(csv_row)

    else:
      
      # print("autofitheight: " + autofitheight)
      if autofitheight == "0":
        # print("autoheight is 0")
        school = {}
        cells = row.findAll('cell')
        country = ''
        # for column in cells:
        for i in range(0, len(cells)):
          if i == key_field_column:
            continue

          column = cells[i]

          if i == country_field_column:
            country = pyUtils.returnNormalText(column.data.contents[0])
            continue
          
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
              school[headers[i]] = float(column.data.contents[0].replace(',', '.'))
            else:
              content = column.data.contents[0]
              # csv_row.append(pyUtils.returnNormalText(content))   
              school[headers[i]] = pyUtils.returnNormalText(content)

        # writer.writerow(csv_row)
        addSchoolData(cells[key_field_column].data.contents[0], year, country, school)

    # print("Row num: " + str(row_num))
    row_num = row_num + 1

  
  # file.close()  

def addSchoolData(schoolName, year, country, data):
  if schoolName not in schools:    
    schools[schoolName] = {}

  value = schools[schoolName]
  value[year] = data
  value['country'] = country

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

    
    country = replaceUS(schools[key]['country'])
    country = replaceUK(country)
    
    obj['country'] = country

    print(obj['country'])

    # removing the 'country' key in the school data
    schools[key].pop('country', None)
    obj['data'] = schools[key]
    # for years in schools[key]:
    #   obj[years] = schools[key][years]

    finalObj.append(obj)

  return finalObj

def replaceUS(text):
  if 'U.S.A.' in text:
    return text.replace('U.S.A.', 'U.S.')
  else: 
    if 'USA' in text:
      return text.replace('USA', 'U.S.')
    else:
      if 'US' in text:
        return text.replace('US', 'U.S.')
  
  return text 

def replaceUK(text):
  if 'UK' in text:
    return text.replace('UK', 'U.K.')

  return text

if __name__ == "__main__":
  print("Parser of Excel XMLs by @vpascual\n")

  if len(sys.argv) < 3:
    sys.exit("Not enough params. Usage: python xml2json [source_folder] [output_file_name]")

  source_folder = sys.argv[1]
  filename = sys.argv[2]
  # list_of_files = pyUtils.getListOfFilesFromPath('data/global-mba-rankings/', '', '.xml')  
  list_of_files = pyUtils.getListOfFilesFromPath(source_folder, '', '.xml')  

  if len(list_of_files) <=0:
    sys.exit("ERROR: Can't find xml files")

  output_file = open(filename, 'wb')
  # writer = csv.writer(output_file, delimiter=';', quotechar='"', quoting=csv.QUOTE_NONNUMERIC)
  for f in list_of_files:
    parseFile(f)

  output_file.write(json.dumps(buildFinalObj()))
