import atws
at = atws.connect(username='nate@arcsource.com',
                  password='MammothHealJoy',
                  support_file_path='/tmp')

''' In SQL this query would be:
SELECT * FROM tickets WHERE
id > 5667
AND
(
 Status = 'Complete'
 OR
 IssueType = 'Non Work Issues'
)
'''
query = atws.Query('Ticket')
query.WHERE('id', query.LessThan, 500)
query.open_bracket('AND')
query.OR('Status', query.Equals, at.picklist['Ticket']['Status']['Complete'])
query.close_bracket()

all_tickets = at.query(query).fetch_all()

print(all_tickets)
