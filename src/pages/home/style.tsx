import styled from "styled-components";
import { Link } from "@reach/router"

export const Container = styled.div`
    width: 100%;
    height: 100vh;
    display: grid;
    grid: [stack] 1fr / min-content [stack] 1fr;


    @media (max-width: 550px) {
        & > * {
            grid-area: stack;
        }
    }
`

export const Sidebar = styled.div`
    padding: 1rem;

    @media (max-width: 550px) {
        visibility: hidden;

        &:target {
            visibility: hidden;
        }
    }
`

export const MyLink = styled(Link)`
    text-decoration: none;
    color: #000;
    padding: 1rem;
    display: block;
    cursor: pointer;
    font-weight: bold;

    &:hover {
        background: #f0f0f0;
    }
`

export const Main = styled.main`
    padding: 1rem;
`