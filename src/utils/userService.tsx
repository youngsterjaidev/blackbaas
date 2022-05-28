import axios from "axios"

const getAllUsers = async () => {
    try {
        let response = await axios({
            url: `http://localhost:8000/users/`,
            method: "GET"
        })
        if(response) {
					return response.data
				}
    } catch (e) {
        console.log("Error Occured while getting all the users info getUsers fn :", e)
    }
}

const addUser = async (email: string, password: string, username: string) => {
    try {
        let response = await axios({
					url: "http://localhost:8000/users/add",
            method: "POST",
            data: {
                email,
                password,
                username
            }
        })

        if (response) {
            return response.data
        }

        return { message: "Something went wrong !" }
    } catch (e) {
        console.log("Error Occured while adding the user in addUser fn :", e)
    }
}

export const userService = {
    getAllUsers,
    addUser
}
