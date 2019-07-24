import sys
import csv
from datetime import datetime


class Snapshot:
    siteName = str
    timestamp = datetime
    isSuccess = bool

    def __init__(self, dattoSnapshotObject):
        self.isSuccess = False
        self.siteName = dattoSnapshotObject["UserName"]
        self.isSuccess = bool(dattoSnapshotObject["SuccessStatus"])
        if dattoSnapshotObject["Timestamp"]:
            self.timestamp = datetime.strptime(
                dattoSnapshotObject["Timestamp"], "%Y-%m-%dT%H:%M:%S.%fZ")


class SiteSummary:
    siteName: str
    earliestBackupTimestamp: datetime
    lastSuccessfulBackupTimestamp: datetime
    completedBackups: int

    def __init__(self, siteName: str, timestamp: datetime):
        self.siteName = siteName
        self.earliestBackupTimestamp = timestamp
        self.completedBackups = 0

    def update(self, newSnapshot: Snapshot):
        # Verify siteName is correct
        if newSnapshot.siteName == self.siteName:
            if newSnapshot.isSuccess:
                self.completedBackups += 1
                if not hasattr(self, 'lastSuccessfulBackupTimestamp') or self.lastSuccessfulBackupTimestamp <= newSnapshot.timestamp:
                    self.lastSuccessfulBackupTimestamp = newSnapshot.timestamp
            if self.earliestBackupTimestamp > newSnapshot.timestamp:
                self.earliestBackupTimestamp = newSnapshot.timestamp
        else:
            print(
                f'\tBad site alignment: {newSnapshot.siteName} -> {self.siteName}')


class SnapshotConsolidator:
    site_name_to_summary_map = {}
    unique_count = 0

    def process_snapshot(self, snapshot):
        if snapshot.siteName != None:
            # check if first time we have seen this site
            if snapshot.siteName not in self.site_name_to_summary_map:
                self.unique_count += 1
                self.site_name_to_summary_map[snapshot.siteName] = SiteSummary(
                    snapshot.siteName, snapshot.timestamp)
            # have appropriate SiteSummary consume the data point
            self.site_name_to_summary_map[snapshot.siteName].update(
                snapshot)

    def report(self):
        print(f'Unique sites found: {self.unique_count}')


# ---------- Start ---------- #
if len(sys.argv) <= 1:
    print("Please provide a file name")
    exit()
import_file = sys.argv[1]
consolidator = SnapshotConsolidator()

# Read in Datto CSV Backup rows
with open(import_file, mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            print(f'Column names are {", ".join(row)}')
            line_count += 1
        elif row["EventType"] == "Backup":
            # For each relevant row, package in Snapshot and process
            thisSnapshot = Snapshot(row)
            consolidator.process_snapshot(thisSnapshot)
            line_count += 1
    print(f'Processed {line_count} lines')

# Organize and output
consolidator.report()
with open('reduced_datto_report.csv', 'w', newline='') as csv_file:
    fieldnames = ['Site Name', 'First Backup',
                  'Latest Successful Backup', 'Total Backups Taken']
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    writer.writeheader()
    siteSummary: SiteSummary
    for siteSummary in consolidator.site_name_to_summary_map.values():
        writer.writerow({'Site Name': siteSummary.siteName,
                         'First Backup': siteSummary.earliestBackupTimestamp.strftime("%Y-%m-%dT%H:%M:%S"),
                         'Latest Successful Backup': siteSummary.lastSuccessfulBackupTimestamp.strftime("%Y-%m-%dT%H:%M:%S"),
                         'Total Backups Taken': siteSummary.completedBackups})
