export type Role = 'student' | 'teacher'

export interface Line {
  type: 'text' | 'math'
  value: string
  uncertain?: boolean
}

export interface StudentWork {
  post_id: string
  photo_url: string
  caption: string
  author: string
}

export interface Note {
  id: string
  class_code: string
  topic: string
  title: string
  kind: string // 'Board notes' | 'Slides' | 'Handout' | 'Class notes'
  lesson?: string | null
  lines: Line[]
  original_lines?: Line[] | null
  diagram?: string | null
  /** built-in figure shown above the notes (image path) */
  figure?: string | null
  photo_url?: string | null
  student_work: StudentWork[]
  created_at: string
  updated_at: string
  /** built-in class material (not stored in the database) */
  builtIn?: boolean
}

export interface Post {
  id: string
  class_code: string
  topic: string
  note_id?: string | null
  title: string
  body: string
  photo_url?: string | null
  photo_lines?: Line[] | null
  voice: boolean
  author_name: string
  author_id: string
  role: Role
  share_status?: 'asked' | 'yes' | 'no' | null
  created_at: string
}

export interface Reply {
  id: string
  class_code: string
  post_id: string
  body: string
  author_name: string
  author_id: string
  role: Role
  created_at: string
}

export interface Session {
  role: Role
  name: string
  classCode: string
  deviceId: string
}
