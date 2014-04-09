from bs4 import BeautifulSoup as Soup
import csv
import pyUtils
import sys

schools = dict()
key_field_name = 'School name'
key_field_column = -1

def parseFile(writer, file):
  print("Reading file " + file)  
  handler = pyUtils.readLocalFile(file)
  year = pyUtils.getFileNameWithoutExtension(file)[pyUtils.getLastIndexOf(file, '-') + 1:]
  # print(handler)
  soup = Soup(handler)
  rows = soup.findAll('row')

  i = 0
  headers_row_num = -1
  found_headers = False
  for row in rows:
    print(row)
    csv_row = []
    styleId = row.get('ss:styleid', '')    
    if found_headers is False:      
      if styleId == 's5':
        found_headers = True
        headers_row_num = i
        cells = row.findAll('data')
        for cell in cells:
          csv_row.append(pyUtils.returnNormalText(cell.contents[0]))

        writer.writerow(csv_row)

    else:
      autofitheight = row.get('ss:AutoFitHeight'.lower(), '')
      # print("autofitheight: " + autofitheight)
      if autofitheight == "0":
        print("autoheight is 0")
        cells = row.findAll('cell')
        for column in cells:
          dataType = column.data['ss:Type'.lower()]
          if len(column.data.contents) == 0:            
            if dataType.lower() == 'number':
              csv_row.append(-100)
            else:
              csv_row.append('')

          else:
            if dataType.lower() == 'number':
              csv_row.append(column.data.contents[0].replace(',', '.'))
            else:
              content = column.data.contents[0]
              csv_row.append(pyUtils.returnNormalText(content))                

        writer.writerow(csv_row)

    # print("Row: " + str(i+1) + " " + '.'.join(csv_row))
    i = i + 1
  
  # file.close()    


if __name__ == "__main__":
  print("Parser of Excel XMLs by @vpascual\n")
  list_of_files = pyUtils.getListOfFilesFromPath('data/global-mba-rankings/', '', '.xml')  
    
  # output_file.close()
  for f in list_of_files:
    output_file = open(pyUtils.getFileNameWithoutExtension(f) + '.csv', 'wb')
    writer = csv.writer(output_file, delimiter=';', quotechar='"', quoting=csv.QUOTE_NONNUMERIC)
    parseFile(writer, f)


