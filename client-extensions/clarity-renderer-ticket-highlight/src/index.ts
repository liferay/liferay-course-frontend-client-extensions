import type {FDSTableCellHTMLElementBuilder} from '@liferay/js-api/data-set';

type TicketStatus = {
	key?: string;
};

const fdsCellRenderer: FDSTableCellHTMLElementBuilder = ({itemData, value}) => {
	const element = document.createElement('div');

	const rawDate = String(value);
	const cellDate = new Date(rawDate);

	if (isNaN(cellDate.getTime())) {
		element.innerHTML = 'Invalid Date';

		return element;
	}

	const now = new Date();
	const thirtyDaysAgo = new Date();

	thirtyDaysAgo.setDate(now.getDate() - 30);

	const ticketStatus = itemData?.ticketStatus as TicketStatus | undefined;
	const statusKey = ticketStatus?.key;

	const isOld = cellDate < thirtyDaysAgo;

	const redStatuses = ['open', 'queued', 'escalated'];
	const orangeStatuses = ['inProgress', 'inReview', 'verifying'];

	element.innerHTML = cellDate.toLocaleDateString();

	if (isOld && statusKey && redStatuses.includes(statusKey)) {
		element.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
		element.innerHTML += ' <span style="font-size:0.8em;"> - OLD</span>';
	}
	else if (isOld && statusKey && orangeStatuses.includes(statusKey)) {
		element.style.backgroundColor = 'rgba(255, 145, 0, 0.2)';
		element.innerHTML += ' <span style="font-size:0.8em;"> - OLD</span>';
	}

	return element;
};

export default fdsCellRenderer;