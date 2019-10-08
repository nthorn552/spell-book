param (
    [string]$adminUsername = $(throw "-adminUsername is required."), 
    [Security.SecureString]$adminPassword = $(throw "-adminPassword is required.")
)

Import-Module AzureAD

$AdminCred = New-Object System.Management.Automation.PSCredential $adminUsername, $adminPassword

try {
    Connect-AzureAD -Credential $AdminCred | Out-Null
    Write-Host "Connected to AzureAD"
}
catch {
    Write-Host "Failed to connect"
}