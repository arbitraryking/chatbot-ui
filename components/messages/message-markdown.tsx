import React, { FC, useState } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeRaw from "rehype-raw"
import { MessageCodeBlock } from "./message-codeblock"
import { MessageMarkdownMemoized } from "./message-markdown-memoized"
import { Components } from "react-markdown"

interface MessageMarkdownProps {
  content: string
  isThinking: boolean
}

type CustomComponents = Components & {
  ThinkBlock?: React.FC<{ children: React.ReactNode }>
}

const ThinkBlock: React.FC<{
  children: React.ReactNode
  isThinking: boolean
}> = ({ children, isThinking }) => {
  const [isOpen, setIsOpen] = useState(true)

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const title = isThinking ? "正在思考" : "思考完毕" // 动态标题

  return (
    <div className="mb-4">
      {/* 标题部分,点击切换折叠状态 */}
      <div
        className="cursor-pointer font-bold text-blue-500 hover:underline"
        onClick={toggleOpen}
      >
        {title} {isOpen ? "▲" : "▼"}
      </div>

      {/* 折叠内容部分 */}
      {isOpen && (
        <div className="mt-2 border-l-4 border-gray-300 pl-4 text-gray-600 dark:text-gray-400">
          {children}
        </div>
      )}
    </div>
  )
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({
  content,
  isThinking
}) => {
  return (
    <MessageMarkdownMemoized
      className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words"
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm, remarkMath]}
      components={
        {
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>
          },
          img({ node, ...props }) {
            return <img className="max-w-[67%]" {...props} />
          },
          code({ node, className, children, ...props }) {
            const childArray = React.Children.toArray(children)
            const firstChild = childArray[0] as React.ReactElement
            const firstChildAsString = React.isValidElement(firstChild)
              ? (firstChild as React.ReactElement).props.children
              : firstChild

            if (firstChildAsString === "▍") {
              return (
                <span className="mt-1 animate-pulse cursor-default">▍</span>
              )
            }

            if (typeof firstChildAsString === "string") {
              childArray[0] = firstChildAsString.replace("`▍`", "▍")
            }

            const match = /language-(\w+)/.exec(className || "")

            if (
              typeof firstChildAsString === "string" &&
              !firstChildAsString.includes("\n")
            ) {
              return (
                <code className={className} {...props}>
                  {childArray}
                </code>
              )
            }

            return (
              <MessageCodeBlock
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(childArray).replace(/\n$/, "")}
                {...props}
              />
            )
          },
          think({ children }: { children: React.ReactNode }) {
            return <ThinkBlock isThinking={isThinking}>{children}</ThinkBlock>
          }
        } as CustomComponents
      }
    >
      {content}
    </MessageMarkdownMemoized>
  )
}
