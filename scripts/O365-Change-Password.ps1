param (
    [string]$adminUsername = $(throw "-adminUsername is required."), 
    [string]$adminPassword = $(throw "-adminPassword is required."),    
    [string]$targetUsername = $(throw "-targetUsername is required."),
    [string]$newPassword = $(throw "-newPassword is required.")
)

Write-Host " --- O365-User-Departure-Procedure started --- "

if (Get-Module -ListAvailable -Name AzureAD) {
    Write-Host "AzureAD exists"
}
else {
    Write-Host "AzureAD did not exist"
    Install-Module AzureAD -Force -SkipPublisherCheck
    Import-Module AzureAD
}
Import-Module AzureAD

$AdminPasswordSecure = ConvertTo-SecureString -String $adminPassword -AsPlainText -Force
$NewPasswordSecure = ConvertTo-SecureString -String $newPassword -AsPlainText -Force
$AdminCred = New-Object System.Management.Automation.PSCredential $adminUsername, $AdminPasswordSecure
$TargetUser = $null

try {
    Connect-AzureAD -Credential $AdminCred | Out-Null
    Write-Host "Connected to AzureAD"
}
catch {
    Write-Host "Failed to connect to AzureAD"
    Exit
}

try {
    $TargetUser = Get-AzureADUser -ObjectId $targetUsername
}
catch {
    Write-Host "User" $targetUsername "not found"
    Exit
}
    
try {
    Set-AzureADUserPassword -ObjectId $targetUsername -Password $NewPasswordSecure
    Write-Host "Password updated successfully" 
}
catch {
    Write-Host "Failed to set user password"
}

if ($shouldLockAccount) {
    try {
        Write-Host "Locking user account"
        $TargetUser | Set-AzureADUser -AccountEnabled $false
        Write-Host "Account lock successful"
    }
    catch {
        Write-Host "Unable to disable account"
    }
}
else {
    Write-Host "Not locking user account"    
}

$TargetUser = Get-AzureADUser -ObjectId $targetUsername
Write-Host $targetUsername "("$TargetUser.DisplayName") account is currently" $(If ($TargetUser.AccountEnabled -eq $false) { "blocked" } Else { "active" }) 
Write-Host " --- O365-User-Departure-Procedure complete --- "
