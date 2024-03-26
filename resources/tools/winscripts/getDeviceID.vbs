' Added by Jammi Dee 01/11/2024
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colItems = objWMIService.ExecQuery("Select * from Win32_ComputerSystemProduct")

For Each objItem in colItems
    Wscript.Echo objItem.UUID
Next


