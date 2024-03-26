' Added by Jammi Dee 01/11/2024

Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colItems = objWMIService.ExecQuery("Select * from Win32_LogicalDisk where DeviceID = 'C:'")

For Each objItem in colItems
    WScript.StdOut.Write objItem.VolumeSerialNumber
Next
