param (
    [string]$User = $(throw "-User is required."), 
    [string]$Password = $(throw "-Password is required."), 
    [string]$IPAddress = $(throw "-IPAddress is required."),
    [switch]$Stop = $false,
    [switch]$Start = $false
)

Import-Module pcsvdevice

$EncryptedPassword = ConvertTo-SecureString -String "$Password" -AsPlainText -Force
$Credential = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $User, $EncryptedPassword
Write-Host "Attempting fetch device at $IPAddress"
Try {
    $Device = Get-PcsvDevice -TimeoutSec 20 -TargetAddress $IPAddress -ManagementProtocol IPMI -Credential $Credential
    if ($Start) {
        Write-Host "Device found, attempting start"
        $Device | Start-PcsvDevice -AsJob
        Write-Host "Start successful"
    }
    elseif ($Stop) {
        Write-Host "Device found, attempting stop"
        $Device | Stop-PcsvDevice -AsJob
        Write-Host "Stop successful"
    }
}
Catch {
    Write-Host "Unable to connect to device"
    Break
}
Break