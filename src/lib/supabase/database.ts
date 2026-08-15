export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PublishedPostRow = {
  slug: string;
  title: string;
  markdown: string;
  author_name: string;
  published_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          role: 'reader' | 'editor' | 'admin';
          suspended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          role?: 'reader' | 'editor' | 'admin';
          suspended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          role?: 'reader' | 'editor' | 'admin';
          suspended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          slug: string;
          title: string;
          markdown: string;
          status: 'draft' | 'published' | 'archived';
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          slug: string;
          title: string;
          markdown?: string;
          status?: 'draft' | 'published' | 'archived';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          slug?: string;
          title?: string;
          markdown?: string;
          status?: 'draft' | 'published' | 'archived';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      published_posts: {
        Args: Record<never, never>;
        Returns: PublishedPostRow[];
      };
    };
    Enums: {
      app_role: 'reader' | 'editor' | 'admin';
      post_status: 'draft' | 'published' | 'archived';
    };
    CompositeTypes: Record<string, never>;
  };
};
