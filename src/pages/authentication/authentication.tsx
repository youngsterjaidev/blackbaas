import React, { useEffect, useState } from "react"
import { userService } from "../../utils/index"
import { Table } from "./style"

export const Authentication = () => {
    const [users, setUsers] = useState([])
		const [isValid, setIsValid] = useState(true)
		const [email, setEmail] = useState("")
		const [password, setPassword] = useState("")
		const [confirmPassword, setConfirmPassword] = useState("")
		const [username, setUsername] = useState("")
		const [feedback, setFeedback] = useState("")

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setFeedback("")
			if(!username && !email && !password && !confirmPassword) {
				setIsValid(false)
			}
		
			if(e.target.name === "username") {
				setUsername(e.target.value)
				return
			}

			if(e.target.name === "email") {
				setEmail(e.target.value)
				return
			}

			if(e.target.name === "password") {
				setPassword(e.target.value)
				return
			}

			if(e.target.name === "confirmPassword") {
				setConfirmPassword(e.target.value)
				return
			}
		}

		const handleSubmit = async (e) => {
			try {
				e.preventDefault()

				const response = await userService.addUser(
					email,
					password,
					username
				)

				if(response) {
					console.log("Response data ", response)
					setFeedback(response.message)
					return
				}
			} catch(e)	 {
				console.log("Error Occured while adding the users handleSubmit fn : ", e)
			}
		}

    useEffect(() => {
        userService.getAllUsers().then((response) => {
            console.log(response)
            setUsers(response)
        })

			/*userService.addUser("test333@gmail.com", "test000", "test333").then((response) => {
				console.log("Adding User Response : ", response)
			}, console.error)*/
    }, [])

    return (
				<>
        <div>
						<form>
							<div>
								<input type="email" placeholder="search the user" />
							</div>
							<div>users - {users.length}</div>
						</form>
						<Table>
							<thead>
								<tr>
									<th>Username</th>
									<th>Email</th>
									<th>Password</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user, index) => {
										const { 
											username, 
											email,
											password
										} = user
										return (
											<tr key={index}>
												<td>{username}</td>		
												<td>{email}</td>		
												<td>{password}</td>		
												<td>
													<button type="button">Delete</button>
													<button type="button">Update</button>
												</td>
											</tr>
										)
								})}
							</tbody>
						</Table>
        </div>

				<form onSubmit={handleSubmit}>
					<div>{ feedback }</div>
					<div>
						<input 
							type="text" 
							value={username}
							name="username"
							placeholder="Enter your username" 
							onChange={handleChange}
						/>
					</div>		
					<div>
						<input 
							type="email" 
							value={email}
							name="email"
							placeholder="Enter your email" 
							onChange={handleChange}
						/>
					</div>
					<div>
						<input 
							type="password" 
							value={password}
							name="password"
							placeholder="Enter your password" 
							onChange={handleChange}
						/>
					</div>
					<div>
						<input 
							type="password" 
							value={confirmPassword}
							name="confirmPassword"
							placeholder="Enter your confirm password" 
							onChange={handleChange}
						/>
					</div>
					<div>
						<button type="submit" disabled={isValid}>Create User</button>
					</div>
				</form>
				</>
    )

}
