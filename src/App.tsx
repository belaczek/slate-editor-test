import * as React from "react";
import "./styles.css";
import styled from "styled-components";
import { SlateEditor } from "./Editor";

const Block = styled.div`
  border: 1px solid black;
`;

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <Block>
        <SlateEditor />
      </Block>
    </div>
  );
}
