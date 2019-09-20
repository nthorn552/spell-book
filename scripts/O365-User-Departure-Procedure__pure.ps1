param (
    [string]$adminUsername = $(throw "-adminUsername is required."), 
    [string]$adminPassword = $(throw "-adminPassword is required."),    
    [string]$targetUsername = $(throw "-targetUsername is required."),
    [string]$newPassword = "HelloWorld123!",
    [switch]$shouldLockAccount = $false
)

Write-Host " --- O365-User-Departure-Procedure started --- "

$AdminPasswordSecure = ConvertTo-SecureString -String $adminPassword -AsPlainText -Force
$NewPasswordSecure = ConvertTo-SecureString -String $newPassword -AsPlainText -Force
$AdminCred = New-Object System.Management.Automation.PSCredential $adminUsername, $AdminPasswordSecure
$TargetUser = $null

try {
    $Session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri https://ps.outlook.com/powershell/ -Credential $AdminCred -Authentication Basic -AllowRedirection
    Set-ExecutionPolicy RemoteSigned
    Import-PSSession $Session
    Write-Host "Connected to AzureAD"
}
catch {
    Write-Host "Failed to connect to AzureAD"
    Exit
}

try {
    $TargetUser = Get-Mailbox -Identity $targetUsername
}
catch {
    Write-Host "User" $targetUsername "not found"
    Remove-PSSession $Session
    Exit
}
    
try {
    $TargetUser | Set-Mailbox -Password $NewPasswordSecure
    Write-Host "Password updated successfully" 
}
catch {
    Write-Host "Failed to set user password"
}

if ($shouldLockAccount) {
    try {
        Write-Host "Locking user account"
        Set-Mailbox -Identity $targetUsername -AccountDisabled $true -Confirm:$false
        Write-Host "Account lock successful"
    }
    catch {
        Write-Host "Unable to disable account"
    }
}
else {
    Write-Host "Not locking user account"    
}

$TargetUser = Get-Mailbox -Identity $targetUsername
Remove-PSSession $Session
Write-Host $targetUsername "("$TargetUser.DisplayName") account is currently" $(If ($TargetUser.AccountEnabled -eq $false) { "blocked" } Else { "active" }) 
Write-Host " --- O365-User-Departure-Procedure complete --- "
