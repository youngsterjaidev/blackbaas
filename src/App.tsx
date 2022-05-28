// using React from the compiling
import React, { useState, useEffect } from "react"
import { Router } from "@reach/router"
import { Home, Authentication, Storage, Database } from "./pages"

const App = () => {
	return (
		<Router>
			{/* @ts-ignore */}
			<Home path="/*" />
		</Router>
	)
}

export default App

