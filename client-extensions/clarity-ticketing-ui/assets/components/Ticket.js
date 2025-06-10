import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../style.css';



// Ticket component
const Ticket = React.memo(({ ticket, onToggle, isOpen }) => (
	<div className="ticket-card" onClick={() => onToggle(ticket.id)}>
		<div className="ticket-header">
			<h3 className="ticket-subject">{ticket.subject}</h3>
			<span className={`ticket-status ${ticket.priority?.key}`}>
				{ticket.ticketStatus.name}
			</span>
		</div>
		{isOpen && (
			<div className="ticket-details">
				<p>Description: {ticket.description}</p>
				{ticket.attachment && (
					<a
						href={ticket.attachment.link.href}
						target="_blank"
						rel="noopener noreferrer"
						className="ticket-attachment"
					>
						View Attachment
					</a>
				)}
				{ticket.relatedTickets && ticket.relatedTickets.length > 0 && (
					<div className="related-tickets">
						<h4>Related Tickets</h4>
						{ticket.relatedTickets.map((related) => (
							<div className="related-ticket-item" key={related.id}>
								ID: {related.id} - {related.subject}
							</div>
						))}
					</div>
				)}
			</div>
		)}
	</div>
));

export default Ticket;