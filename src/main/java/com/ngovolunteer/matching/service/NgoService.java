package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.Ngo;
import com.ngovolunteer.matching.repository.NgoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NgoService {

    private final NgoRepository ngoRepository;

    public NgoService(NgoRepository ngoRepository) {
        this.ngoRepository = ngoRepository;
    }

    public Ngo createNgo(Ngo ngo) {
        return ngoRepository.save(ngo);
    }

    public List<Ngo> getAllNgos() {
        return ngoRepository.findAll();
    }

    public Ngo getNgoById(Long id) {
        return ngoRepository.findById(id).orElse(null);
    }

    public Ngo updateNgo(Long id, Ngo ngo) {
        Ngo existingNgo = ngoRepository.findById(id).orElse(null);

        if (existingNgo == null) {
            return null;
        }

        existingNgo.setOrganisationName(ngo.getOrganisationName());
        existingNgo.setDomain(ngo.getDomain());
        existingNgo.setUser(ngo.getUser());

        return ngoRepository.save(existingNgo);
    }

    public void deleteNgo(Long id) {
        ngoRepository.deleteById(id);
    }
}