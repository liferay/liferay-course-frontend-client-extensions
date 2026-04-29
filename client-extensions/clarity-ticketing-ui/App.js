import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TicketsList from './assets/components/TicketsList';

function App() {

  const baseURL = window.Liferay.ThemeDisplay.getLayoutRelativeURL();
  const friendlyURLMapper = "/-/clarity-ticketing-ui";

  return (
    <div className="App">
      <BrowserRouter basename={baseURL}>
        <Routes>
          <Route path="" element={<TicketsList status="open" />} />
          <Route path={friendlyURLMapper + "/open"} element={<TicketsList status="open" />} />
          <Route path={friendlyURLMapper + "/inProgress"} element={<TicketsList status="inProgress" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );  

}

export default App;