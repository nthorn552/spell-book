param (
    [string]$AdminUsername = $(throw "-AdminUsername is required."), 
    [string]$AdminPassword = $(throw "-AdminPassword is required."),    
    [string]$Username = $(throw "-Username is required."),
    [string]$NewPassword = "HellowWorld1!",
    [switch]$ShouldLockUser = $false
)

Write-Host (Get-Host | Select-Object Version)
if (Get-Module -ListAvailable -Name AzureAD) {
    Write-Host "AzureAD exists"
    Import-Module AzureAD
} else {
    Write-Host "AzureAD did not exist"
    Install-Module AzureAD -Force -SkipPublisherCheck
    Import-Module AzureAD
}

$AdminPasswordSecure = ConvertTo-SecureString -String $AdminPassword -AsPlainText -Force
$NewPasswordSecure = ConvertTo-SecureString -String $NewPassword -AsPlainText -Force
$AdminCred = New-Object System.Management.Automation.PSCredential $AdminUsername, $AdminPasswordSecure
$Admin = Connect-AzureAD -Credential $AdminCred
$TargetUser = $null

try {
    $TargetUser = Get-AzureADUser -ObjectId $Username
} catch {
    Write-Host "User" $Username "not found"
    Exit
}

    
try {
    Set-AzureADUserPassword -ObjectId $Username -Password $NewPasswordSecure
    Write-Host "Password updated successfully" 
} catch {
    Write-Host "Failed to set user password"
}

if ($ShouldLockUser -eq $true) {
    try {
        Write-Host "Locking user account"
        $TargetUser | Set-AzureADUser -AccountEnabled $false
        Write-Host "Account lock successful"
    } catch {
        Write-Host "Unable to disable account"
    }
} else {
    Write-Host "Not locking user account"    
}
$TargetUser = Get-AzureADUser -ObjectId $Username
Write-Host $Username "("$TargetUser.DisplayName") account is currently" $(If ($TargetUser.AccountEnabled -eq $false) {"blocked"} Else {"active"}) 

Write-Host " --- Script complete --- "
