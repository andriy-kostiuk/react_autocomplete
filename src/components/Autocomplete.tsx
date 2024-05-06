import React, {
  useCallback,
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { Person } from '../types/Person';
import debounce from 'lodash.debounce';

interface Props {
  people: Person[];
  setSelectPerson: (person: Person | null) => void;
  delay?: number;
}

export const Autocomplete: React.FC<Props> = ({
  people,
  setSelectPerson,
  delay = 300,
}) => {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [dropdownMenuVisible, setDropdownMenuVisible] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const applyQuery = useCallback(debounce(setAppliedQuery, delay), []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownMenuVisible(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const filteredPeople = useMemo(() => {
    return people.filter(person =>
      person.name.toLowerCase().includes(appliedQuery.toLowerCase()),
    );
  }, [appliedQuery, people]);

  return (
    <>
      <div className="dropdown is-active" ref={dropdownRef}>
        <div className="dropdown-trigger">
          <input
            value={query}
            onChange={evt => {
              setQuery(evt.target.value);
              applyQuery(evt.target.value);
              setSelectPerson(null);
            }}
            onFocus={() => setDropdownMenuVisible(true)}
            type="text"
            placeholder="Enter a part of the name"
            className="input"
            data-cy="search-input"
          />
        </div>

        {dropdownMenuVisible && !!filteredPeople.length && (
          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            <div className="dropdown-content">
              {filteredPeople.map(person => {
                return (
                  <div
                    key={person.slug}
                    className="dropdown-item"
                    data-cy="suggestion-item"
                  >
                    <p
                      className="has-text-link"
                      onClick={() => {
                        setSelectPerson(person);
                        setQuery(person.name);
                        setAppliedQuery(person.name);
                        setDropdownMenuVisible(false);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {person.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {dropdownMenuVisible && !filteredPeople.length && (
        <div
          className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
          role="alert"
          data-cy="no-suggestions-message"
        >
          <p className="has-text-danger">No matching suggestions</p>
        </div>
      )}
    </>
  );
};
