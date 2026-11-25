Set WshShell = CreateObject("WScript.Shell")
root = "C:\Users\monal\Music\Quatation\Quatation-Webapp\"

WshShell.Run "cmd /c cd /d """ & root & "Quatation-Backend"" && npm run dev", 0, False
WshShell.Run "cmd /c cd /d """ & root & "Quatation-Frontend"" && npm run dev", 0, False

Function IsUp(url)
    On Error Resume Next
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.Open "GET", url, False
    http.Send()
    If Err.Number = 0 And http.Status >= 200 And http.Status < 500 Then
        IsUp = True
    Else
        IsUp = False
    End If
    On Error Goto 0
End Function

maxWaitSeconds = 60
elapsed = 0
Do While elapsed < maxWaitSeconds
    If IsUp("http://localhost:5173") Then Exit Do
    WScript.Sleep 1000
    elapsed = elapsed + 1
Loop

WshShell.Run "http://localhost:5173", 1, False
