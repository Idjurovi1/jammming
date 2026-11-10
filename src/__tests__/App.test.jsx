import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import App from '../App';
import Spotify from '../util/Spotify';

// Mock podaci umjesto pravog Spotify API-ja
const MOCK_TRACKS = [
  { id: '1', name: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', uri: 'spotify:track:1' },
  { id: '2', name: 'Imagine', artist: 'John Lennon', album: 'Imagine', uri: 'spotify:track:2' },
];

vi.mock('../util/Spotify', () => ({
  default: {
    getAccessToken: vi.fn(),
    search: vi.fn(),
    savePlaylist: vi.fn(),
  },
}));

describe('Jammming', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    Spotify.search.mockResolvedValue(MOCK_TRACKS);
    Spotify.savePlaylist.mockResolvedValue('playlist-id');
  });

  it('pretraga prikazuje naziv, izvođača i album', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText('Search'), 'queen');
    await userEvent.click(screen.getByText('SEARCH'));
    expect(Spotify.search).toHaveBeenCalledWith('queen');
    expect(await screen.findByText('Bohemian Rhapsody')).toBeInTheDocument();
    expect(screen.getByText('Queen | A Night at the Opera')).toBeInTheDocument();
  });

  it('dodavanje i uklanjanje pjesme iz playliste', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('SEARCH'));
    await userEvent.click(await screen.findByLabelText('Add Imagine'));
    expect(screen.getByLabelText('Remove Imagine')).toBeInTheDocument();
    expect(screen.queryByLabelText('Add Imagine')).not.toBeInTheDocument(); // nestaje iz rezultata
    await userEvent.click(screen.getByLabelText('Remove Imagine'));
    expect(screen.queryByLabelText('Remove Imagine')).not.toBeInTheDocument();
  });

  it('preimenovanje i spremanje playliste šalje URI-je i resetira playlistu', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('SEARCH'));
    await userEvent.click(await screen.findByLabelText('Add Bohemian Rhapsody'));
    await userEvent.click(screen.getByLabelText('Add Imagine'));
    const name = screen.getByLabelText('Playlist name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Moja lista');
    await userEvent.click(screen.getByText('SAVE TO SPOTIFY'));
    expect(Spotify.savePlaylist).toHaveBeenCalledWith('Moja lista', ['spotify:track:1', 'spotify:track:2']);
    expect(await screen.findByDisplayValue('New Playlist')).toBeInTheDocument();
    expect(screen.queryByLabelText('Remove Imagine')).not.toBeInTheDocument();
  });

  it('gumb za spremanje je onemogućen kad je playlista prazna', () => {
    render(<App />);
    expect(screen.getByText('SAVE TO SPOTIFY')).toBeDisabled();
  });
});
