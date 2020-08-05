import isHotkey from "is-hotkey";
import React, { Component, FC } from "react";
import { createEditor, Editor, Transforms } from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact
} from "slate-react";
import { MenuButton, Toolbar } from "./Toolbar";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

export class SlateEditor extends Component {
  state = {
    value: localStorage.getItem("value")
      ? JSON.parse("value")
      : [
          {
            type: "paragraph",
            children: [{ text: "A line of text in a paragraph." }]
          }
        ],
    readOnly: false
  };

  setValue = (value: any) => {
    this.setState({ value });
    localStorage.setItem("value", value);
  };

  editor = withHistory(withReact(createEditor()));

  renderElement = (props: RenderElementProps) => <Element {...props} />;
  renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />;

  render() {
    return (
      <Slate
        editor={this.editor}
        value={this.state.value}
        onChange={this.setValue}
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
          {/* <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike" /> */}
        </Toolbar>
        <Editable
          renderElement={this.renderElement}
          renderLeaf={this.renderLeaf}
          autoFocus
          onKeyDown={(event) => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, (event as any) as KeyboardEvent)) {
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
    match: (n) => LIST_TYPES.includes(String(n.type)),
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
      onClick={(event) => {
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
      onMouseDown={(event) => {
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
    match: (n) => n.type === format
  });

  return !!match;
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

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
