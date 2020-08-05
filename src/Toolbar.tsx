import React from "react";
import styled from "styled-components";

export const Menu = styled.div`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }
`;

// export const Menu = React.forwardRef(({ className, ...props }, ref) => (
//   <SMenu {...props} ref={ref} />
// ));

export const Toolbar = styled(Menu)`
  position: relative;
  padding: 1px 18px 17px;
  /* margin: 0 -20px; */
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
`;

export const MenuButton = styled.button<{ active?: boolean }>`
  background-color: ${p => (p.active ? "white" : "black")};
  color: ${p => (p.active ? "black" : "white")};
`;
