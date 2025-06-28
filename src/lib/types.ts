type User = {
  id: number
  token: string
  username: string
}

// Poll option type for radio buttons
type PollOption = {
  id: string
  label: string
}

// Radio poll configuration
type RadioPollConfig = {
  type: 'radio'
  options: PollOption[]
}

// Scale poll configuration
type ScalePollConfig = {
  type: 'scale'
  min: number
  max: number
  minLabel: string
  maxLabel: string
}

// Union type for all poll configurations
type PollConfig = RadioPollConfig | ScalePollConfig

type PostType = 'text' | 'radio' | 'scale'

type PostBase = {
  id: number
  user_id: number
  post_type: PostType
  title: string
  content: string | null
  sort_order: number
  poll_config: PollConfig | null
}

type Post = PostBase &
  (
    | {
        post_type: 'text'
        poll_config: null
      }
    | {
        post_type: 'radio'
        poll_config: RadioPollConfig
      }
    | {
        post_type: 'scale'
        poll_config: ScalePollConfig
      }
  )

type PostWithDetails = PostBase & {
  comment_count: number
  response_count: number
  comments: CommentWithDetails[]
  heartCount: number
  userHearted: boolean
  userResponse: ResponseData | null
  pollResults: PollAggregates | null
} & (
    | {
        post_type: 'text'
        poll_config: null
        pollResults: null
      }
    | {
        post_type: 'radio'
        poll_config: RadioPollConfig
        pollResults: RadioPollAggregates | null
      }
    | {
        post_type: 'scale'
        poll_config: ScalePollConfig
        pollResults: ScalePollAggregates | null
      }
  )

type RadioPollAggregates = {
  type: 'radio'
  totalResponses: number
  options: Array<{
    option_id: string
    label: string
    count: number
    percentage: number
  }>
  specialOptions: Array<{
    type: 'prefer_not_to_say' | 'not_applicable'
    count: number
  }>
}
type ScalePollAggregates = {
  type: 'scale'
  totalResponses: number
  average: number
  min: number
  max: number
  configMin: number
  configMax: number
  distribution: Array<{
    value: number
    count: number
    percentage: number
  }>
  specialOptions: Array<{
    type: 'prefer_not_to_say' | 'not_applicable'
    count: number
  }>
}

type PollAggregates = RadioPollAggregates | ScalePollAggregates

type Comment = {
  id: number
  user_id: number
  post_id: number
  content: string
}

type CommentWithDetails = Comment & {
  heartCount: number
  userHearted: boolean
}

type PollResponse = {
  id: number
  user_id: number
  post_id: number
  response_data: string
}

type ResponseData = {
  selectedOption?: string
  scaleValue?: number
  specialOption?: 'prefer_not_to_say' | 'not_applicable' | null
}

type TargetType = 'post' | 'comment'

export type {
  User,
  PostWithDetails,
  RadioPollAggregates,
  ScalePollAggregates,
  PollAggregates,
  PollConfig,
  Post,
  PostType,
  Comment,
  CommentWithDetails,
  PollResponse,
  ResponseData,
  TargetType,
}
