import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../style.css';
import Ticket from './Ticket';



// API helper function
const api = async (url, options = {}) => {
	return fetch(window.location.origin + '/' + url, {
		headers: {
			'Content-Type': 'application/json',
			'x-csrf-token': Liferay.authToken,
		},
		...options,
	});
};

// Function to get current user ID
const getCurrentUserId = async () => {
	const response = await api('o/headless-admin-user/v1.0/my-user-account');
	const data = await response.json();
	return data.id;
};



// Main component to display tabs and tickets list
function TicketsList() {
	const [tickets, setTickets] = useState([]);
	const [expandedTicket, setExpandedTicket] = useState(null);
	const [selectedStatus, setSelectedStatus] = useState('open');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				setIsLoading(true);
				const userId = await getCurrentUserId();
				const response = await api('o/c/tickets');
				const data = await response.json();
				const userTickets = (data.items || []).filter(
					(ticket) => ticket.creator?.id === userId
				);
				setTickets(userTickets || []);
			} catch (error) {
				console.error('Error fetching tickets:', error);
				setError('Failed to load tickets.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchTickets();
	}, []);

	const toggleTicket = (ticketId) => {
		setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
	};

	const filteredTickets = tickets.filter(
		(ticket) => ticket.ticketStatus.key === selectedStatus
	);

	if (isLoading) {
		return <div className="loading">Loading...</div>;
	}

	if (error) {
		return <div className="error">{error}</div>;
	}

	if (filteredTickets.length === 0) {
		return <div className="no-tickets">No tickets available for this status.</div>;
	}

	return (
		<div className="tickets-container">
			<div className="tabs">
				{['open', 'inProgress'].map((status) => (
					<button
						key={status}
						className={`tab-button ${selectedStatus === status ? 'active' : ''}`}
						onClick={() => setSelectedStatus(status)}
						aria-selected={selectedStatus === status}
					>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</button>
				))}
			</div>
			<div className="tickets-list">
				{filteredTickets.map((ticket) => (
					<Ticket
						key={ticket.id}
						ticket={ticket}
						onToggle={toggleTicket}
						isOpen={expandedTicket === ticket.id}
					/>
				))}
			</div>
		</div>
	);
}


export default TicketsList;