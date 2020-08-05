import React, { Component, FC } from "react";
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  RenderLeafProps,
  useSlate
} from "slate-react";
import { createEditor, Transforms, Editor, Text } from "slate";
import styled from "styled-components";
import { withHistory } from "slate-history";
import { MenuButton, Toolbar } from "./Toolbar";
import isHotkey from "is-hotkey";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

export class SlateEditor extends Component {
  state = {
    value: [
      {
        type: "paragraph",
        children: [{ text: "A line of text in a paragraph." }]
      }
    ]
  };

  editor = withHistory(withReact(createEditor()));

  renderElement = (props: RenderElementProps) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      case "h1":
        return <H1Element {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  };

  renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />;

  handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) {
      return;
    }
    switch (event.key) {
      case "`": {
        event.preventDefault();
        const [match] = Editor.nodes(this.editor, {
          match: n => n.type === "code"
        });
        Transforms.setNodes(
          this.editor,
          { type: match ? null : "code" },
          { match: n => Editor.isBlock(this.editor, n) }
        );
        break;
      }
      case "b": {
        event.preventDefault();
        Transforms.setNodes(
          this.editor,
          { bold: true },
          { match: n => Text.isText(n), split: true }
        );
        break;
      }
    }
  };

  render() {
    return (
      <Slate
        editor={this.editor}
        value={this.state.value}
        onChange={value => this.setState({ value })}
      >
        <Toolbar>
          <MarkButton format="bold" />
          <MarkButton format="italic" />
          <MarkButton format="underline" />
          <MarkButton format="code" />
          <BlockButton format="heading-one" />
          <BlockButton format="heading-two" />
          <BlockButton format="block-quote" />
          <BlockButton format="numbered-list" />
          <BlockButton format="bulleted-list" />
        </Toolbar>
        <Editable
          renderElement={this.renderElement}
          renderLeaf={this.renderLeaf}
          autoFocus
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = (HOTKEYS as any)[hotkey];
                toggleMark(this.editor, mark);
              }
            }
          }}
        />
      </Slate>
    );
  }
}

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const BlockButton: FC<{ format: string }> = ({ format }) => {
  const editor = useSlate();
  return (
    <MenuButton
      onClick={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {format}
    </MenuButton>
  );
};

const MarkButton: FC<{ format: string }> = ({ format }) => {
  const editor = useSlate();
  return (
    <MenuButton
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {format}
    </MenuButton>
  );
};

const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Define a React component to render leaves with bold text.
// const Leaf = (props: RenderLeafProps) => {
//   return (
//     <span
//       {...props.attributes}
//       style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}
//     >
//       {props.children}
//     </span>
//   );
// };

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const CodeElement = (props: RenderElementProps) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = (props: RenderElementProps) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const H1 = styled.h1``;

const H1Element = (props: RenderElementProps) => {
  return <H1 {...props.attributes}>{props.children}</H1>;
};
