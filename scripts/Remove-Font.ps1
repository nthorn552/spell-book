#########################################################################################
#   MICROSOFT LEGAL STATEMENT FOR SAMPLE SCRIPTS/CODE
#########################################################################################
#   This Sample Code is provided for the purpose of illustration only and is not 
#   intended to be used in a production environment.
#
#   THIS SAMPLE CODE AND ANY RELATED INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY 
#   OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED 
#   WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#
#   We grant You a nonexclusive, royalty-free right to use and modify the Sample Code 
#   and to reproduce and distribute the object code form of the Sample Code, provided 
#   that You agree: 
#   (i)    to not use Our name, logo, or trademarks to market Your software product 
#          in which the Sample Code is embedded; 
#   (ii)   to include a valid copyright notice on Your software product in which 
#          the Sample Code is embedded; and 
#   (iii)  to indemnify, hold harmless, and defend Us and Our suppliers from and 
#          against any claims or lawsuits, including attorneys’ fees, that arise 
#          or result from the use or distribution of the Sample Code.
#########################################################################################

#******************************************************************************
# File:     Remove-Font.ps1
# Date:     08/28/2013
# Version:  1.0.1
#
# Purpose:  PowerShell script to uninstall a Windows font.
#
# Usage:    Remove-Font -help | -path "<Font file name>"
#
# Copyright (C) 2010 Microsoft Corporation
#
#
# Revisions:
# ----------
# 1.0.0   09/22/2010   Created script.
# 1.0.1   08/28/2013   Now checking if $error[0] is not null before trying to
#                      echo that value in Remove-SingleFont so as not to
#                      generate an error when none occurred.
#
#******************************************************************************

#requires -Version 2.0

#*******************************************************************
# Declare Parameters
#*******************************************************************
param(
    [string] $file = "",
    [switch] $help = $false
)


#*******************************************************************
# Declare Global Variables and Constants
#*******************************************************************

# Define constants
set-variable CSIDL_FONTS 0x14 -option constant

# Create hashtable containing valid font file extensions and text to append to Registry entry name.
$hashFontFileTypes = @{}
$hashFontFileTypes.Add(".fon", "")
$hashFontFileTypes.Add(".fnt", "")
$hashFontFileTypes.Add(".ttf", " (TrueType)")
$hashFontFileTypes.Add(".ttc", " (TrueType)")
$hashFontFileTypes.Add(".otf", " (OpenType)")
# Type 1 fonts require handling multiple resource files.
# Not supported in this script
#$hashFontFileTypes.Add(".mmm", "")
#$hashFontFileTypes.Add(".pbf", "")
#$hashFontFileTypes.Add(".pfm", "")

# Initialize variables
$invocation = (Get-Variable MyInvocation -Scope 0).Value
$scriptPath = Split-Path $Invocation.MyCommand.Path
$fontRegistryPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"


#*******************************************************************
# Declare Functions
#*******************************************************************

#*******************************************************************
# Function Get-SpecialFolder()
#
# Purpose:  Convert a CSIDL string to a folder parh string
#
# Input:    $id    CSIDL folder identifier string
#
# Returns:  Folder path
#
#*******************************************************************
function Get-SpecialFolder($id)
{
    $shell = New-Object –COM "Shell.Application"
    $folder = $shell.NameSpace($id)
    $specialFolder = $folder.Self.Path
    $specialFolder
}


#*******************************************************************
# Function Get-RegistryStringNameFromValue()
#
# Purpose:  Return the Registry value name
#
# Input:    $keyPath    Regsitry key drive path
#           $valueData  Regsitry value sting data
#
# Returns:  Registry string value name
#
#*******************************************************************
function Get-RegistryStringNameFromValue([string] $keyPath, [string] $valueData)
{
    $pattern = [Regex]::Escape($valueData)

    foreach($property in (Get-ItemProperty $keyPath).PsObject.Properties)
    {
        ## Skip the property if it was one PowerShell added
        if(($property.Name -eq "PSPath") -or
            ($property.Name -eq "PSChildName"))
        {
            continue
        }
        ## Search the text of the property
        $propertyText = "$($property.Value)"
        if($propertyText -match $pattern)
        {
            "$($property.Name)"
        }
    }
}


#*******************************************************************
# Function Remove-SingleFont()
#
# Purpose:  Uninstall a font file
#
# Input:    $file    Font file name
#
# Returns:  0 - success, 1 - failure
#
#*******************************************************************
function Remove-SingleFont($file)
{
    try
    {
        $fontFinalPath = Join-Path $fontsFolderPath $file
        $retVal = [FontResource.AddRemoveFonts]::RemoveFont($fontFinalPath)
        if ($retVal -eq 0) {
            Write-Host "Font `'$($file)`' removal failed"
            Write-Host ""
            1
        }
        else
        {
            $fontRegistryvaluename = (Get-RegistryStringNameFromValue $fontRegistryPath $file)
            Write-Host "Font: $($fontRegistryvaluename)"
            if ($fontRegistryvaluename -ne "")
            {
                Remove-ItemProperty -path $fontRegistryPath -name $fontRegistryvaluename
            }
            Remove-Item $fontFinalPath
            if ($error[0] -ne $null)
            {
                Write-Host "An error occured removing $`'$($file)`'"
                Write-Host ""
                Write-Host "$($error[0].ToString())"
                $error.clear()
            }
            else
            {
                Write-Host "Font `'$($file)`' removed successfully"
                Write-Host ""
            }
            0
        }
        ""
    }
    catch
    {
        Write-Host "An error occured removing `'$($file)`'"
        Write-Host ""
        Write-Host "$($error[0].ToString())"
        Write-Host ""
        $error.clear()
        1
    }
}


#*******************************************************************
# Function Show-Usage()
#
# Purpose:   Shows the correct usage to the user.
#
# Input:     None
#
# Output:    Help messages are displayed on screen.
#
#*******************************************************************
function Show-Usage()
{
$usage = @'
Remove-Font.ps1
This script is used to uninstall a Windows font.

Usage:
Remove-Font.ps1 -help | -path "<Font file name>"

Parameters:

    -help
     Displays usage information.

    -file
     Font file name.  Files located in \Windows\Fonts.  Valid file 
     types are .fon, .fnt, .ttf,.ttc, .otf, .mmm, .pbf, and .pfm

Examples:
    Remove-Font.ps1
    Remove-Font.ps1 -file "MyFont.ttf"
'@

$usage

$fontsFolderPath
}


#*******************************************************************
# Function Process-Arguments()
#
# Purpose: To validate parameters and their values
#
# Input:   All parameters
#
# Output:  Exit script if parameters are invalid
#
#*******************************************************************
function Process-Arguments()
{
    ## Write-host 'Processing Arguments'

    if ($unnamedArgs.Length -gt 0)
    {
        write-host "The following arguments are not defined:"
        $unnamedArgs
    }

    if ($help -eq $true) 
    { 
        Show-Usage
        break
    }

    $fontFilePath = Join-Path $fontsFolderPath $file
    if ((Test-Path $fontFilePath -PathType Leaf) -eq $true)
    {
        If ($hashFontFileTypes.ContainsKey((Get-Item $fontFilePath).Extension))
        {
            $retVal = Remove-SingleFont $file
            if ($retVal -ne 0)
            {
                exit 1
            }
            else
            {
                exit 0
            }
        }
        else
        {
            "`'$($fontFilePath)`' not a valid font file type"
            ""
            exit 1
        }
    }
    else
    {
        "`'$($fontFilePath)`' not found"
        ""
        exit 1
    }
}


#*******************************************************************
# Main Script
#*******************************************************************

$fontsFolderPath = Get-SpecialFolder($CSIDL_FONTS)
Process-Arguments

