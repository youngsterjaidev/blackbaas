// using React from the compiling
import React, { useState, useEffect } from "react"
import { Router } from "@reach/router"
import {
	Container,
	Sidebar,
	Main,
	MyLink
} from "./style"
import { Authentication, Storage, Database } from "../index"

export const Home = () => {
	return (
		<Container>
			<Sidebar id="sidenav-open">
				<MyLink to="/">Authentication</MyLink>
				<MyLink to="/">Storage</MyLink>
				<MyLink to="/">Database</MyLink>
			</Sidebar>
			<Main>
				<a href="#sidenav-open">
					open
				</a>
				<Router>
					{/* @ts-ignore */}
					<Authentication path="/" />
					{/* @ts-ignore */}
					<Storage path="/storage" />
					{/* @ts-ignore */}
					<Database path="/database" />
				</Router>
			</Main>
		</Container>
	)
}
