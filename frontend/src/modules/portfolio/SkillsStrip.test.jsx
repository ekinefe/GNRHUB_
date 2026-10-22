import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SkillsStrip from './SkillsStrip'
import { projectsUsing } from './projectsUsing'

describe('projectsUsing', () => {
    const list = [{ name: 'A', tech: ['C++', 'Arduino'] }, { name: 'B', tech: ['Bash', 'Linux Automation'] }]
    it('matches a skill to the projects that list it', () => {
        expect(projectsUsing('C/C++', list)).toEqual(['A'])
        expect(projectsUsing('Arduino (C/C++)', list)).toEqual(['A'])
        expect(projectsUsing('Linux', list)).toEqual(['B'])
        expect(projectsUsing('Figma', list)).toEqual([])
    })
})

describe('SkillsStrip', () => {
    it('groups the skills and links the ones used in projects to /projects', () => {
        render(<MemoryRouter><SkillsStrip /></MemoryRouter>)
        for (const g of ['Languages', 'Web', 'Tools']) expect(screen.getByRole('heading', { name: g })).toBeInTheDocument()
        expect(screen.getByText('Python')).toBeInTheDocument()
        const used = screen.getAllByRole('link', { name: /used in/ })
        expect(used.length).toBeGreaterThan(0)
        for (const a of used) expect(a).toHaveAttribute('href', '/projects')
    })
})
