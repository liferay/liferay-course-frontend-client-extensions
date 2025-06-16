import type {FDSTableCellHTMLElementBuilder} from '@liferay/js-api/data-set';

declare const Liferay: any;

const fdsCellRenderer: FDSTableCellHTMLElementBuilder = ({value}) => {
	const element = document.createElement('div');

	if (typeof value !== 'number') {
		element.innerHTML = 'Invalid ID';
		return element;
	}

	const ticketId = value;

	const button = document.createElement('button');
	button.textContent = 'Notify';
	button.className = 'btn btn-sm btn-primary';

	button.addEventListener('click', async () => {
		try {
			const response = await Liferay.Util.fetch(
				`/o/c/tickets/${ticketId}/object-actions/ticketRequiresAttention`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
				}
			);

			if (response.ok) {
				Liferay.Util.openToast({
					message: 'Notification successfully sent!',
					title: 'Success',
					type: 'success',
				});
			} else {
				const errorText = await response.text();
				Liferay.Util.openToast({
					message: `Error when sending notification: ${errorText}`,
					title: 'Error',
					type: 'danger',
				});
			}
		} catch (error) {
			Liferay.Util.openToast({
				message: `Unexpected error: ${error}`,
				title: 'Error',
				type: 'danger',
			});
		}
	});

	element.appendChild(button);
	return element;
};

export default fdsCellRenderer;