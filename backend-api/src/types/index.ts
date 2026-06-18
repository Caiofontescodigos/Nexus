export interface JwtPayload {
  userId: string;
  email: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: string;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: string;
}
