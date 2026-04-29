import type {FDSFilter} from '@liferay/js-api/data-set';

const RED_STATUSES = ['open', 'queued', 'escalated'];
const ORANGE_STATUSES = ['inProgress', 'inReview', 'verifying'];

function escapeODataString(value: string) {
	return value.replace(/'/g, "''");
}

function descriptionBuilder(selectedData?: string) {
	if (selectedData === 'critical') {
		return 'Critical tickets';
	}

	if (selectedData === 'late') {
		return 'Late tickets';
	}

	return '';
}

function buildStatusClause(statusKeys: string[]) {
	return statusKeys
		.map((key) => `ticketStatus eq '${escapeODataString(key)}'`)
		.join(' or ');
}

function oDataQueryBuilder(selectedData?: string) {
	const thirtyDaysAgo = new Date();

	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const isoDate = thirtyDaysAgo.toISOString();

	if (selectedData === 'critical') {
		return `(dateCreated lt ${isoDate} and (${buildStatusClause(RED_STATUSES)}))`;
	}

	if (selectedData === 'late') {
		return `(dateCreated lt ${isoDate} and (${buildStatusClause(ORANGE_STATUSES)}))`;
	}

	return '';
}

function htmlElementBuilder({
	filter,
	setFilter,
}: {
	filter?: {
		selectedData?: string;
	};
	setFilter: (filter: {selectedData: string}) => void;
}) {
	const div = document.createElement('div');

	div.className = 'dropdown-item';

	const select = document.createElement('select');

	select.className = 'form-control';

	const options = [
		{
			label: 'Select ticket age…',
			value: '',
		},
		{
			label: 'Critical tickets',
			value: 'critical',
		},
		{
			label: 'Late tickets',
			value: 'late',
		},
	];

	for (const optionData of options) {
		const option = document.createElement('option');

		option.value = optionData.value;
		option.textContent = optionData.label;

		select.appendChild(option);
	}

	select.value = filter?.selectedData || '';

	const applyButton = document.createElement('button');

	applyButton.className = 'btn btn-block btn-secondary btn-sm mt-2';
	applyButton.type = 'button';
	applyButton.innerText = 'Apply';

	applyButton.onclick = () => {
		setFilter({
			selectedData: select.value,
		});
	};

	const clearButton = document.createElement('button');

	clearButton.className = 'btn btn-block btn-link btn-sm mt-1 p-0';
	clearButton.type = 'button';
	clearButton.innerText = 'Clear';
	clearButton.style.textAlign = 'left';

	clearButton.onclick = () => {
		select.value = '';

		setFilter({
			selectedData: '',
		});
	};

	div.appendChild(select);
	div.appendChild(applyButton);
	div.appendChild(clearButton);

	return div;
}

const ticketAgeStatusFilter: FDSFilter<any> = {
	descriptionBuilder,
	htmlElementBuilder,
	oDataQueryBuilder,
};

export default ticketAgeStatusFilter;