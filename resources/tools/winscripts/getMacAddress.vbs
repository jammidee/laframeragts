' Added by Jammi Dee 01/19/2024

Option Explicit

' Function to get the MAC address
Function GetMacAddress()
    Dim objWMIService, colItems, objItem
    Dim macAddress
    
    ' Create a WMI service object
    Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
    
    ' Query for network adapters
    Set colItems = objWMIService.ExecQuery("Select * From Win32_NetworkAdapterConfiguration Where IPEnabled = True")
    
    ' Loop through the results
    For Each objItem In colItems
        ' Check if MACAddress property exists
        If Not IsNull(objItem.MACAddress) Then
            ' Get the MAC address
            macAddress = objItem.MACAddress
            Exit For
        End If
    Next
    
    ' Output the MAC address
    If Len(macAddress) > 0 Then
        WScript.Echo macAddress
    Else
        WScript.Echo "MAC Address not found."
    End If
End Function

' Call the function to get the MAC address
GetMacAddress
