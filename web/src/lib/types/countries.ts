export interface CountryRequirements {
    company_types?: string[]
    min_capital?: string
    local_director?: string
    registered_address?: string
    documents?: string[]
    timeline?: string
    tax_info?: string
    [key: string]: unknown
}

export interface Country {
    id?: number | string
    code: string
    name: string
    flag_emoji?: string | null
    avg_cost?: string | null
    is_active: boolean
    requirements?: CountryRequirements | null
}

export interface CountryUpsertInput {
    code: string
    name: string
    flag_emoji?: string | null
    avg_cost?: string | null
    is_active: boolean
    requirements: CountryRequirements
}
