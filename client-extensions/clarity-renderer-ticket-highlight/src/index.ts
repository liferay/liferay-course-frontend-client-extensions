import type {FDSTableCellHTMLElementBuilder} from '@liferay/js-api/data-set';

const fdsCellRenderer: FDSTableCellHTMLElementBuilder = ({value}) => {
	const element = document.createElement('div');

	const rawDate = String(value);
	const cellDate = new Date(rawDate);

	if (!isNaN(cellDate.getTime())) {
		const now = new Date();
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(now.getDate() - 30);

		if (cellDate < thirtyDaysAgo) {
			element.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
			element.innerHTML = `${cellDate.toLocaleDateString()} <span style="font-size:0.8em;"> - OLD</span>`;
		} else {
			element.innerHTML = cellDate.toLocaleDateString();
		}
	} else {
		element.innerHTML = 'Invalid Date';
	}

	return element;
};

export default fdsCellRenderer;