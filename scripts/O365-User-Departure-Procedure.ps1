param (
    [string]$AdminUsername = $(throw "-AdminUsername is required."), 
    [string]$AdminPassword = $(throw "-AdminPassword is required."),    
    [string]$Username = $(throw "-Username is required."),
    [string]$RawNewPassword = "HellowWorld1!",
    [switch]$ShouldLockUser = $false
)

Import-Module AzureAD

$AdminPassword = ConvertTo-SecureString -String $AdminPassword -AsPlainText -Force
$NewPassword = ConvertTo-SecureString -String $RawNewPassword -AsPlainText -Force
$AdminCred = New-Object System.Management.Automation.PSCredential $AdminUsername, $AdminPassword
$Admin = Connect-AzureAD -Credential $AdminCred

$TargetUser = Get-AzureADUser -ObjectId $Username
Write-Host "Found user" $TargetUser.UserPrincipalName
try{
    $PasswordResetResult = Set-AzureADUserPassword -ObjectId $TargetUser.ObjectId -Password $NewPassword
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

Write-Host " --- Script complete --- "
$TargetUser = Get-AzureADUser -ObjectId $Username
Write-Host $Username "("$TargetUser.DisplayName")" "password updated, and account is currently" $(If ($TargetUser.AccountEnabled -eq $false) {"blocked"} Else {"active"})