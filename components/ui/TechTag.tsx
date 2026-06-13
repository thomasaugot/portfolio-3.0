interface Props {
  tag: string
}

export function TechTag({ tag }: Props) {
  return (
    <span className="font-mono text-[13px] py-2 px-3 border border-border-2 bg-surface text-text cursor-default relative transition-[border-color,color,background] hover:border-primary hover:text-primary hover:bg-[rgba(212,255,58,0.04)]">
      {tag}
    </span>
  )
}
